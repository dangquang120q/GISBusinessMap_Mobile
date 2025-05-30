import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ForeignersService from '../../services/ForeignersService';

const ForeignerManagementScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState('');
  
  // API integration states
  const [foreigners, setForeigners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    skipCount: 0,
    maxResultCount: 20,
    totalCount: 0,
  });

  // Status constants
  const STATUS_ACTIVE = 'Đang hoạt động';
  const STATUS_PENDING = 'Chờ xác nhận';
  const STATUS_EXPIRED = 'Hết hạn';
  
  // Function to format date from API
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  // Function to fetch foreigners data from API
  const fetchForeigners = useCallback(async (refresh = false) => {
    try {
      const newSkipCount = refresh ? 0 : pagination.skipCount;
      
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      // Prepare API parameters
      const params = {
        skipCount: newSkipCount,
        maxResultCount: pagination.maxResultCount,
        keyword: searchQuery,
      };
      
      // Add additional filter parameters if needed
      if (nationalitySearch) {
        params.countryName = nationalitySearch;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Call the API
      const response = await ForeignersService.getAllByBusiness(params);
      
      // Update state with API response
      if (refresh) {
        setForeigners(response.items || []);
      } else {
        setForeigners(prev => [...prev, ...(response.items || [])]);
      }
      
      setPagination({
        skipCount: newSkipCount + (response.items?.length || 0),
        maxResultCount: pagination.maxResultCount,
        totalCount: response.totalCount || 0,
      });
    } catch (err) {
      setError('Không thể tải danh sách người nước ngoài. Vui lòng thử lại sau.');
      console.error('Error fetching foreigners:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách người nước ngoài. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.skipCount, pagination.maxResultCount, searchQuery, nationalitySearch, statusFilter]);
  
  // Load data when component mounts or filters change
  useEffect(() => {
    fetchForeigners(true);
  }, [fetchForeigners]);
  
  // Function to handle refreshing
  const onRefresh = useCallback(() => {
    fetchForeigners(true);
  }, [fetchForeigners]);
  
  // Function to load more data when scrolling to bottom
  const handleLoadMore = () => {
    if (!loading && pagination.skipCount < pagination.totalCount) {
      fetchForeigners();
    }
  };
  
  // Check if visa or residence card is expired
  const checkIfExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };
  
  // Calculate statistics counts from API data
  const getStatusCount = (status) => {
    return foreigners.filter(f => f.status === status).length;
  };
  
  const handleViewDetails = (foreigner) => {
    navigation.navigate('ForeignerDetail', { foreigner, foreignerId: foreigner.id });
  };
  
  const handleAddForeigner = () => {
    navigation.navigate('AddForeigner');
  };
  
  // Get status display based on data
  const getStatusDisplay = (foreigner) => {
    if (foreigner.status) return foreigner.status;
    
    // Fallback logic if status is not set
    if (checkIfExpired(foreigner.visaExpiryDate) || 
        checkIfExpired(foreigner.workPermitExpiryDate) || 
        checkIfExpired(foreigner.residenceCardExpiry)) {
      return STATUS_EXPIRED;
    }
    
    return STATUS_ACTIVE;
  };
  
  const getStatusStyle = (status) => {
    switch(status) {
      case STATUS_ACTIVE:
        return styles.activeStatus;
      case STATUS_PENDING:
        return styles.pendingStatus;
      case STATUS_EXPIRED:
        return styles.expiredStatus;
      default:
        return styles.activeStatus;
    }
  };
  
  const renderForeignerItem = ({ item }) => {
    const status = getStatusDisplay(item);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleViewDetails(item)}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={32} color="#085924" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.fullName}</Text>
            <Text style={styles.cardSubtitle}>Hộ chiếu: {item.passportNumber}</Text>
            <Text style={styles.cardSubtitle}>Quốc tịch: {item.countryName}</Text>
            {item.jobTitle && (
              <Text style={styles.cardSubtitle}>Vị trí: {item.jobTitle}</Text>
            )}
            <View style={[styles.statusBadge, getStatusStyle(status)]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#085924" />
      </TouchableOpacity>
    );
  };
  
  const resetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setNationalitySearch('');
    setShowFilterModal(false);
  };
  
  const applyFilters = () => {
    setShowFilterModal(false);
    // Fetching will be triggered by useEffect when the filters change
    fetchForeigners(true);
  };
  
  // Render footer for FlatList with loading indicator
  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#085924" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý người nước ngoài</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Ionicons name="filter" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, hộ chiếu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchForeigners(true)}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              fetchForeigners(true);
            }}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.advancedSearchButton, advancedSearch && styles.activeAdvancedButton]}
          onPress={() => setAdvancedSearch(!advancedSearch)}
        >
          <Ionicons name={advancedSearch ? "chevron-up" : "chevron-down"} size={20} color="#085924" />
        </TouchableOpacity>
      </View>
      
      {advancedSearch && (
        <View style={styles.advancedSearchContainer}>
          <View style={styles.advancedSearchInputContainer}>
            <Text style={styles.advancedSearchLabel}>Quốc tịch:</Text>
            <TextInput
              style={styles.advancedSearchInput}
              placeholder="Nhập quốc tịch..."
              value={nationalitySearch}
              onChangeText={setNationalitySearch}
            />
          </View>
          
          <View style={styles.advancedSearchRow}>
            <Text style={styles.advancedSearchLabel}>Trạng thái:</Text>
            <View style={styles.statusChips}>
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === 'all' && styles.activeStatusChip]}
                onPress={() => setStatusFilter('all')}
              >
                <Text style={[styles.statusChipText, statusFilter === 'all' && styles.activeStatusChipText]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === STATUS_ACTIVE && styles.activeStatusChip]}
                onPress={() => setStatusFilter(STATUS_ACTIVE)}
              >
                <Text style={[styles.statusChipText, statusFilter === STATUS_ACTIVE && styles.activeStatusChipText]}>
                  Đang hoạt động
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === STATUS_PENDING && styles.activeStatusChip]}
                onPress={() => setStatusFilter(STATUS_PENDING)}
              >
                <Text style={[styles.statusChipText, statusFilter === STATUS_PENDING && styles.activeStatusChipText]}>
                  Chờ xác nhận
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statusChip, statusFilter === STATUS_EXPIRED && styles.activeStatusChip]}
                onPress={() => setStatusFilter(STATUS_EXPIRED)}
              >
                <Text style={[styles.statusChipText, statusFilter === STATUS_EXPIRED && styles.activeStatusChipText]}>
                  Hết hạn
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Đặt lại bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getStatusCount(STATUS_ACTIVE)}</Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getStatusCount(STATUS_PENDING)}</Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getStatusCount(STATUS_EXPIRED)}</Text>
          <Text style={styles.statLabel}>Hết hạn</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{pagination.totalCount || foreigners.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>Đã tìm thấy {pagination.totalCount || foreigners.length} người</Text>
        
        {statusFilter !== 'all' && (
          <View style={styles.activeFilterContainer}>
            <Text style={styles.activeFilterLabel}>Lọc theo: </Text>
            <View style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterText}>{statusFilter}</Text>
              <TouchableOpacity onPress={() => setStatusFilter('all')}>
                <Ionicons name="close-circle" size={16} color="#085924" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#d9534f" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchForeigners(true)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={foreigners}
          renderItem={renderForeignerItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#085924']}
            />
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#085924" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="#085924" />
                <Text style={styles.emptyText}>Không tìm thấy người nước ngoài</Text>
              </View>
            )
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddForeigner}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Đăng ký người nước ngoài mới</Text>
      </TouchableOpacity>
      
      {/* Filter Modal */}
      <Modal
        transparent={true}
        visible={showFilterModal}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Tùy chọn lọc</Text>
            
            <Text style={styles.modalSectionTitle}>Trạng thái</Text>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === 'all' && styles.selectedFilter]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[styles.filterOptionText, statusFilter === 'all' && styles.selectedFilterText]}>
                Tất cả
              </Text>
              {statusFilter === 'all' && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === STATUS_ACTIVE && styles.selectedFilter]}
              onPress={() => setStatusFilter(STATUS_ACTIVE)}
            >
              <Text style={[styles.filterOptionText, statusFilter === STATUS_ACTIVE && styles.selectedFilterText]}>
                Đang hoạt động
              </Text>
              {statusFilter === STATUS_ACTIVE && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === STATUS_PENDING && styles.selectedFilter]}
              onPress={() => setStatusFilter(STATUS_PENDING)}
            >
              <Text style={[styles.filterOptionText, statusFilter === STATUS_PENDING && styles.selectedFilterText]}>
                Chờ xác nhận
              </Text>
              {statusFilter === STATUS_PENDING && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, statusFilter === STATUS_EXPIRED && styles.selectedFilter]}
              onPress={() => setStatusFilter(STATUS_EXPIRED)}
            >
              <Text style={[styles.filterOptionText, statusFilter === STATUS_EXPIRED && styles.selectedFilterText]}>
                Hết hạn
              </Text>
              {statusFilter === STATUS_EXPIRED && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            
            <Text style={styles.modalSectionTitle}>Quốc tịch</Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập quốc tịch cần lọc..."
                value={nationalitySearch}
                onChangeText={setNationalitySearch}
              />
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.modalResetButton}
                onPress={resetFilters}
              >
                <Text style={styles.modalResetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalApplyButton}
                onPress={applyFilters}
              >
                <Text style={styles.modalApplyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#085924',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  filterButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  advancedSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeAdvancedButton: {
    backgroundColor: '#e0f2e9',
  },
  advancedSearchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  advancedSearchInputContainer: {
    marginBottom: 12,
  },
  advancedSearchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  advancedSearchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  advancedSearchRow: {
    marginBottom: 12,
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusChip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeStatusChip: {
    backgroundColor: '#085924',
    borderColor: '#085924',
  },
  statusChipText: {
    fontSize: 12,
    color: '#333',
  },
  activeStatusChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resetButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    color: '#085924',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#085924',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2e9',
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#085924',
    marginRight: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeStatus: {
    backgroundColor: '#d4edda',
  },
  pendingStatus: {
    backgroundColor: '#fff3cd',
  },
  expiredStatus: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#085924',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  footerText: {
    marginLeft: 10,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#085924',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedFilter: {
    backgroundColor: '#085924',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalResetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalResetButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  modalApplyButton: {
    backgroundColor: '#085924',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalApplyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ForeignerManagementScreen;